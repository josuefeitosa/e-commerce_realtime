'use strict'

const Database = use('Database');
const User = use('App/Models/User');
const Role = use('Role');

class AuthController {

    async register({request, response}) {
        //Cria a transaction para as operações no banco de dados
        const transaction = await Database.beginTransaction();

        try{
            
            const { name, surname, email, password } = await request.all();
            
            //Atribui propriedades para criação do usuário.
            const user_data = {
                name,
                surname,
                email,
                password
            };
            const user = await User.create(user_data, transaction);

            //Atribui role de cliente (Customer) para o usuário criado.
            const userRole = await Role.findBy('slug', 'client');
            await user.roles().attach([userRole.id], null, transaction);

            //Comita a transaction
            await transaction.commit();

            return response.status(201).send({included_data: user});

        } catch {
            //Faz o rollback em caso de erro.
            await transaction.rollback();

            return response.status(400).send({
                message: 'Erro ao fazer cadastro!'
            });
        }
    }

    async login({request, response, auth}) {
        const { email, password } = request.all();

        let token_data = await auth.withRefreshToken().attempt(email, password);

        return response.send({token_data});
    }

    async refresh({request, response, auth}) {
        let refresh_token = request.input('refresh_token');

        if (!refresh_token) {
            refresh_token = request.header('refresh_token');
        }
        //Gera novo token
        const user = await auth.newRefreshToken().generateForRefreshToken(refresh_token);

        return response.send({data: user});   
    }

    async logout({request, response, auth}) {
        let refresh_token = request.input('refresh_token');

        if (!refresh_token) {
            refresh_token = request.header('refresh_token');
        }
        //Revoga token e deleta do banco de dados
        const loggedOut = auth.authenticator('jwt').revokeTokens([refresh_token], true);

        return response.status(204).send({data_loggedOut: loggedOut});
    }

    async forgot({request, response}) {

    }

    async remember({request, response}) {

    }

    async reset({request, response}) {

    }
}

module.exports = AuthController
