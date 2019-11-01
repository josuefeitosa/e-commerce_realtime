'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const ImageTransformer = use('App/Transformers/Admin/ImageTransformer');
/**
 * UserTransformer class
 *
 * @class UserTransformer
 * @constructor
 */
class UserTransformer extends BumblebeeTransformer {

  defaultInclude(){
    return ['image']
  }
  /**
   * This method is used to transform the data.
   */
  transform (model) {
    return {
      id: model.id,
      name: model.name,
      surname: model.surname,
      email: model.email
    }
  }

  includeImage(model){
    return this.item(user.getRelated('images'), ImageTransformer);
  }
}

module.exports = UserTransformer
