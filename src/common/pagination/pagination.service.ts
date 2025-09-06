import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import {
  Repository,
  ObjectLiteral,
  FindOptionsWhere,
  FindManyOptions,
  FindOptionsOrder,
} from 'typeorm';
import { Request } from 'express';
import { PaginationQueryDTO } from './dtos/pagination-query.dto';
import { PaginatedResponse } from './paginated-response';

@Injectable()
export class PaginationService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  public async paginateQuery<T extends ObjectLiteral>(
    paginationDto: PaginationQueryDTO<T>, // 👈 allow sendAll
    repository: Repository<T>,
    where?: FindOptionsWhere<T>,
    relations?: string[],
  ): Promise<PaginatedResponse<T>> {
    const {
      pageNumber = 1,
      perPage = 5,
      sendAll = false,
      sortBy = 'createdAt',
      order = 'ASC',
    } = paginationDto;

    const findOptions: FindManyOptions<T> = {};
    console.log(sortBy, order, 'query');
    if (sortBy) {
      findOptions.order = { [sortBy]: order } as FindOptionsOrder<T>;
    }

    if (!sendAll) {
      // Normal paginated flow
      findOptions.skip = (pageNumber - 1) * perPage;
      findOptions.take = perPage;
    }

    if (where) {
      findOptions.where = where;
    }
    if (relations) {
      findOptions.relations = relations.reduce((acc, relation) => {
        acc[relation] = true;
        return acc;
      }, {});
    }

    // ✅ Query results
    const result = await repository.find(findOptions);
    const totalItems = await repository.count({ where });
    // ✅ Helper Function

    const baseUrl = `${this.request.protocol}://${this.request.headers.host}`;
    const currentUrl = new URL(this.request.originalUrl, baseUrl);

    const buildUrl = (page: number): string => {
      const params = new URLSearchParams(currentUrl.search);
      params.set('pageNumber', page.toString());
      params.set('perPage', perPage.toString());
      return `${baseUrl}${currentUrl.pathname}?${params.toString()}`;
    };
    // ✅ If sendAll = true → return everything without pagination
    if (sendAll) {
      return {
        data: result,
        meta: {
          itemsPerPage: totalItems,
          currentPage: 1,
          totalItems,
          totalPages: 1,
        },
        links: {
          first: buildUrl(1),
          last: buildUrl(1),
          previous: null,
          current: buildUrl(1),
          next: null,
        },
      };
    }

    // ✅ Normal pagination calculations
    const totalPages = Math.ceil(totalItems / perPage);
    const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;
    const prevPage = pageNumber === 1 ? null : pageNumber - 1;

    // Helper to build links while keeping other filters intact

    return {
      data: result,
      meta: {
        itemsPerPage: perPage,
        currentPage: pageNumber,
        totalItems,
        totalPages,
      },
      links: {
        first: buildUrl(1),
        last: buildUrl(totalPages),
        previous: prevPage ? buildUrl(prevPage) : null,
        current: buildUrl(pageNumber),
        next: nextPage ? buildUrl(nextPage) : null,
      },
    };
  }
}
