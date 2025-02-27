// /* eslint-disable @typescript-eslint/no-unsafe-return */
// /* eslint-disable @typescript-eslint/no-unsafe-call */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import { JwtService } from '@nestjs/jwt';
// import { jwtConstants } from '../constants/jwtConstants';
// import { UnauthorizedException } from '@nestjs/common';

// const jwtService = new JwtService({
//   secret: jwtConstants.secret,
// });

// async function getUserDataFromToken(request: Request) {
//   const token = extractTokenFromHeader(request);
//   if (!token) {
//     throw new UnauthorizedException();
//   }
//   try {
//     const payload = await jwtService.verifyAsync(token, {
//       secret: jwtConstants.secret,
//     });
//     // Assigning the payload to the request object here
//     // so that we can access it in our route handlers
//     request['user'] = payload;
//     return payload;
//   } catch {
//     throw new UnauthorizedException();
//   }
// }

// function extractTokenFromHeader(request: Request): string | undefined {
//   const authorizationHeader = request.headers.get('authorization');
//   const [type, token] = authorizationHeader?.split(' ') ?? [];
//   return type === 'Bearer' ? token : undefined;
// }

// export { getUserDataFromToken, extractTokenFromHeader };
