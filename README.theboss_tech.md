# Running theboss.tech

Edit `.env.production` file.

```bash
# build
docker-compose build
# migrate
docker-compose run --rm web rake db:migrate
# assets precompile
docker-compose run --rm web rake assets:precompile
# up
docker-compose up -d --remove-orphans
```

# Running masi.theboss.tech

Edit `.env.production.masi` file.

```bash
# build
docker-compose -f docker-compose-masi.yml build
# migrate
docker-compose -f docker-compose-masi.yml run --rm web rake db:migrate
# assets precompile
docker-compose -f docker-compose-masi.yml run --rm web rake assets:precompile
# up
docker-compose -f docker-compose-masi.yml up -d --remove-orphans
```
