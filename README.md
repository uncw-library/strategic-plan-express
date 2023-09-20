# strategic-plan-express

Note:  these display term updates were requested & implemented in 2023.  The code retains the old terms, but the html uses the new terms.

    "Action Areas" => "Pillars"
    "Goals" => "Priorities"
    "Objectives" => "Strategy"

### push to production

```
docker build --no-cache --platform linux/x86_64/v8 -t libapps-admin.uncw.edu:8000/randall-dev/strategic-plan-express .
docker push libapps-admin.uncw.edu:8000/randall-dev/strategic-plan-express 
```

To spin up a dev box, place a dump of the production db into ./db_autoimport .  Then `docker-compose up`

See it at localhost:3000

To revise the db, first try revising it via the frontend.  (the portions that an end-user might want to revise often are editable via the frontend, when logged in.)   If the frontend doesn't do your revision, you can connect pgAdmin to the db (the port is in rancher in the environment options).

#### The db tables.

"action_areas" is the main table.  Its "rank" field sets the display order on the frontend.

"goals" links to "action_areas" row via goals.action_area == action_area.id.  There can be several "goals" for each "action_area"  

"objectives" also links to "action_areas" via objectices.action_area == action_area.id.  Its "rank" field sets the display order.

"notes" links to "objectives" via notes.objective_id == objectives.id.

The following three are constants tables.  They constrain the values in the frontend Edit forms.  (the goal is:  "these tables hold the available choices for the forms, therefore people will only be POSTing available choices via the forms.  No "in process", "In pROcess", "Ongoing", "Working on it", etc in the dbs.  Just these available choices.")

"objective_status" is the choices ["Complete", "In Process", "Not Started", "On Hold", and any other status]  "rank" field sets the display order on the frontend.

"objective_year" is the choices ["2021 - 2022", "1492 - 1493", etc]  The "isactive" fields sets whether they are displayed on the frontend.  The "rank" field sets the display order.

"users" is the choices ["smithj", "johnsonl", etc]  The "isactive" field sets whether they are displayed on the frontend.

These constants tables are not used by anything except the frontend forms.  They limit the available options for those forms.

#### Search box:

Anything that can change over time is stored in the db.  Other things are hardcoded in html or nodejs.  

The searchfields are pulled from the db, and don't need to be hardcoded.  (i.e., "SELECT UNIQUE target_date from action_areas")  These do not pull from the constants tables, but from the "action_areas", "goals", "objectives", "notes" tables.  Because we don't want the searchoptions to include every possible value.  We only want to include values that match at least one item.

#### CSV download:

This works the same as the previous React app.
