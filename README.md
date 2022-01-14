# betterdo-api

The API for [BetterDo](https://betterdo.app/). This repository houses the application logic by providing a simple REST API.

It's recommended you run this with the UI. See [betterdo-ui](https://github.com/brandon-pereira/betterdo-ui/).

## Features

-   🤖 Simple usable REST API
-   🤓 Elegant application structure for easy adaption
-   ✅ 100% end-to-end test coverage
-   🛤Ability to authenticate with Google (and ability to add others) 🛤
-   ⌨️ Built on TypeScript
-   🎼 Leverages GitHub actions for automated production deploys and testing

## Endpoints

-   `/` - The landing page
-   `/app` - The application (requires authentication)
-   `/auth/google` - Authenticate with Google Endpoint
-   `/auth/google/callback` - Google authentication callback
-   `/auth/logout` - Logout endpoint
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
-   `/api/users/:email` - GET method for seeing if a user exists with an email
-   `/api/user` - GET method for current user information
-   `/api/users` - POST method for modifying current user
