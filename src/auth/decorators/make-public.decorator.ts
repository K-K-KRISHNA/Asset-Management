import { SetMetadata } from '@nestjs/common';

export const MakePublic = () => {
  return SetMetadata('isPublic', true);
};
