## Contributing to SafeBot

To explore the MongoDB that is initialised by the `docker-compose.yml` file, you can run the following `mongo-express` image and click here to browse it.

```bash
$ docker run -it --rm \
    --network safemoon-bot_safemoon \
    --name mongo-express \
    -p 8081:8081 \
    -e ME_CONFIG_OPTIONS_EDITORTHEME="ambiance" \
    -e ME_CONFIG_MONGODB_SERVER="db" \
    -e ME_CONFIG_MONGODB_ADMINUSERNAME="safemoon" \
    -e ME_CONFIG_MONGODB_ADMINPASSWORD="safemoon" \
    -e ME_CONFIG_BASICAUTH_USERNAME="sfm" \
    -e ME_CONFIG_BASICAUTH_PASSWORD="sfm" \
    mongo-express
```
