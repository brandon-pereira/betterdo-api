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
            method: 'POST',
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
        fetch('/api/lists', {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: '1234',
                title: "Hello"
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