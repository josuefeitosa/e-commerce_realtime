'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Image = use('App/Models/Image');
const { manage_single_upload, manage_multiple_uploads} = use('App/Helpers');
const fs = use('fs');
const Transformer = use('App/Transformers/Admin/ImageTransformer');

/**
 * Resourceful controller for interacting with images
 */
class ImageController {
  /**
   * Show a list of all images.
   * GET images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {TransformWith} ctx.transform
   */
  async index ({ response, pagination, transform }) {
    var images = await Image.query().orderBy('id', 'DESC').paginate(pagination.page, pagination.limit);

    images = await transform.paginate(images, Transformer);
    return response.send(images);
  }

  /**
   * Create/save a new image.
   * POST images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    try {
      const fileJar = request.file('images', {
        types: ['image'],
        size: '2mb'
      });

      let images = [];

      if (!fileJar.files) {
        const file = await manage_single_upload(fileJar);

        if (file.moved) {
          const image = await Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype
          })

          const transformedImage = await transform.item(image, Transformer);

          images.push(transformedImage);
          return response.status(400).send({successes: images, errors: {}});
        } else {
          return response.status(400).send({message: 'Não foi possível processar esta imagem no momento!'});
        }
      } else {
        let files = await manage_multiple_uploads(fileJar);

        await Promise.all(
          files.successes.map(async file => {
            const image = await Image.create({
              path: file.fileName,
              size: file.size,
              original_name: file.clientName,
              extension: file.subtype
            })

            const transformedImage = await transform.item(image, Transformer);
            images.push(transformedImage)
          })
        )}

        return response.status(201).send({successes: images, errors: {}})

    } catch (error) {
      return response.status(400).send({message: 'Não possível processar a sua solicitação no momento.'})
    }
  }

  /**
   * Display a single image.
   * GET images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, response}) {
    var image = await Image.findOrFail(params.id);

    images = await transform.item(images, Transformer);
    return response.send(image);
  }

  /**
   * Update image details.
   * PUT or PATCH images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
    var image = await Image.findOrFail(params.id);

    try {
      await image.merge(request.only['original_name']);

      await image.save();

      images = await transform.item(images, Transformer);
      return response.status(200).send(image);
    } catch (error) {
      return response.status(400).send({message: 'Não foi possível atualizar esta imagem no momento'});
    }
  }

  /**
   * Delete a image with id.
   * DELETE images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, response }) {
    var image = await Image.findOrFail(params.id);

    try {
      let filepath = Helpers.publicPath(`uploads/${image.path}`);

      await fs.unlink(filepath, error => {
        if (!error)
          await image.delete();
      });

    } catch (error) {
      return response.status(400).send({message: 'Não foi possível deletar a imagem no momento'});      
    }
  }
  
}

module.exports = ImageController
