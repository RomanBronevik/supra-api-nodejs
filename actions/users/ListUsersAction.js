const { RequestRule } = require('supra-core')
const joi = require('@hapi/joi')

const BaseAction = require('../BaseAction')
const UserDAO = require('../../dao/UserDAO')
const { Rule } = require('supra-core')

/**
 * @description return users list
 */
class ListUsersAction extends BaseAction {
  static get accessTag () {
    return 'users:list'
  }

  static get validationRules () {
    return {
      query: {
        ...this.baseQueryParams,
        orderBy: new RequestRule(new Rule({
          validator: v => {
            const result = joi.object({
              field: joi.string().valid('createdAt', 'username'),
              direction: joi.string().valid('asc', 'desc')
            }).validate(v)
            return result.error && result.error.message || true
          },
          description: 'Object; { field: username, direction: asc || desc }'
        })),
        filter: new RequestRule(new Rule({
          validator: v => {
            const result = joi.object({
              username: joi.string().min(2)
            }, e => e ? e.message : true)
            return result.error && result.error.message || true
          },
          description: 'String; min 2 chars;'
        }))
      }
    }
  }

  static async run (req) {
    const { query } = req
    const data = await UserDAO.baseGetList({ ...query })

    return this.result({
      data: data.results,
      headers: {
        'X-Total-Count': data.total
      }
    })
  }
}

module.exports = ListUsersAction
