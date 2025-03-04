import { authHandlers } from '@/mocks/handlers/authHandlers';
import { postHandlers } from '@/mocks/handlers/postHandlers';
import { commentHandlers } from '@/mocks/handlers/commentHandlers';

export const handlers = [...authHandlers, ...postHandlers, ...commentHandlers];
