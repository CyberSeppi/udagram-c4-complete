import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

//import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
//import { Jwt } from '../../auth/Jwt'
//import { JwtPayload } from '../../auth/JwtPayload'
import { authenticate } from './lib'

const logger = createLogger('auth')

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {

  logger.info('Authorizing a user', event.authorizationToken)

  try {
    const authResult = await authenticate(event)
    logger.info('AuthResult', authResult)

    return authResult
  }
  catch (e) {
    logger.info('Authorization failed with ', e)
    return {
      principalId: 'apigateway.amazonaws.com',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

