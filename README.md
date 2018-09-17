# betterdo-api

The API for BetterDo.

## Endpoints

-   `/auth/google` - Authenticate with Google Endpoint
-   `/auth/google/callback` - Google authentication callback
-   `/auth/logout` - Logout endpoint
-   `/api/lists`

    -   `GET`: get lists
        ```javascript
        fetch('/api/lists');
        ```
    -   `PUT` add list
        ```javascript
        fetch('/api/lists', {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'Header'
            })
        });
        ```
    -   `POST` update list

        ```javascript
        fetch('/api/lists/5b9bf1b62b505fcf6501c82b', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'Hello!'
            })
        });
        ```

```javascript
fetch('/api/tasks', {
    method: 'PUT',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        title: 'Test',
        list: '5b9d4a3d1a4c9e3dd0c14c60'
    })
});
```

### TODO

-   [ ] `get` api/init: user info and high level of lists
-   [ ] Update user tasks on update/delete of tasks
-   [ ] Support for custom lists ('inbox', 'high-priority', 'today', 'tomorrow', etc.)
-   [ ] Merge subtasks between server/front-end (or should it blindly trust?)
-   [ ] Unit tests for tasks
-   [ ] Update user data? (maybe this is v2?)
