# betterdo-api

The API for BetterDo. This repository controls the UI routing and enables a REST API.

It's recommended you run this with the UI. See [betterdo-ui](https://github.com/brandon-pereira/betterdo-ui/).

**NOTE**: This is still a WIP. See below for a full list of todos. Also see below for a list of things I'd like to add.

## Features

-   Simple usable REST API 🤖
-   Elegant application structure for easy adaption 🤓
-   100% end-to-end test coverage ✅
-   Ability to authenticate with Google (and ability to add others) 🛤

## Endpoints

-   `/` - The landing page
-   `/app` - The application (requires authentication)
-   `/auth/google` - Authenticate with Google Endpoint
-   `/auth/google/callback` - Google authentication callback
-   `/auth/logout` - Logout endpoint
-   `/init` - Initialization payload. Returns user info, inbox info, and list of lists.
-   `/api/lists` - Methods around updating lists

    -   `GET`: get lists
    -   `PUT` add list
    -   `POST` update list
    -   `DELETE` delete list

-   `/api/tasks` - Methods around updating tasks

    -   `GET`: get task
    -   `PUT` add task
    -   `POST` update task
    -   `DELETE` deleteTask

### TODO

-   [ ] Merge subtasks between server/front-end (or should it blindly trust?)
-   [ ] Allow updating list order (and validate)

### Future Feature Ideas

-   [ ] Recurring tasks
-   [ ] Update user data
