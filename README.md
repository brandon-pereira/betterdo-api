# betterdo-api

The API for BetterDo.

## Endpoints

- `/auth/google` - Authenticate with Google Endpoint
- `/auth/google/callback` - Google authentication callback 
- `/auth/logout` - Logout endpoint
- `/api/lists`
    - `GET`: get lists
        ```javascript
        fetch('/api/lists')
        ```
    - `PUT` add list
        ```javascript
        fetch('/api/lists', {
            method: 'PUT',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: "Header"
            })
        })
      ```
    - `POST` update list

        ```javascript
        fetch('/api/lists/5b9bf1b62b505fcf6501c82b', {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: "Hello!"
            })
        })
        ```


```javascript
fetch('/api/tasks', {
    method: 'PUT',
    headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        title: "Test",
        list: "5b99d4d74a6df02dbddf9097"
    })
})
```

### INIT

- [ ] `get` api/init: user info and high level of lists

### Tasks

- [ ] `post` api/tasks/:taskid update task in list
- [X] `put` api/tasks add task to list
- [ ] `delete` api/tasks/:taskid delete task

### Lists

- [X] `get` api/lists get user lists
- [X] `get` api/lists/:listid get user list by id
- [X] `post` api/lists/:listid update list
- [X] `put` api/lists add new list
- [X] `delete` api/lists/:listid delete list