# strategic-plan-express

### push to production

```
docker build --no-cache --platform linux/x86_64/v8 -t libapps-admin.uncw.edu:8000/randall-dev/strategic-plan-express .
docker push libapps-admin.uncw.edu:8000/randall-dev/strategic-plan-express 
```

To spin up a dev box, place a dump of the production db into ./db_autoimport .  Then `docker-compose up`

See it at localhost:3000

To revise the db, first try revising it via the frontend.  (the portions that an end-user might want to revise often are editable via the frontend, when logged in.)   If the frontend doesn't do your revision, you can connect pgAdmin to the db (the port is in rancher in the environment options).

#### The four db tables.  

"action_areas" is the main table.  Its "rank" field sets the display order on the frontend.

"goals" links to "action_areas" row via its "action_area" field.  There can be several "goals" for each "action_area"  

"objectives" also links to "action_areas" via its "action_area" field.  Its "rank" field sets the display order.

"notes" links to "objectives" via its "objective_id" field.

"superusers" is an unused table.

#### Search box:

Anything that can change over time is stored in the db.  Other things are hardcoded in html or nodejs.  

The searchfields are pulled from the db, and don't need to be hardcoded.  (i.e., "SELECT UNIQUE target_date from action_areas")

#### CSV download:

This works the same as the previous React app.
