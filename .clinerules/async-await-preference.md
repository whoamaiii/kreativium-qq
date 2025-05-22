## Brief overview
These guidelines specify the preferred method for handling asynchronous operations in JavaScript/TypeScript.

## Asynchronous Operations
- **Prefer async/await:** Always use `async/await` syntax for handling asynchronous operations. This improves code readability and makes it easier to follow the control flow compared to Promise `.then()` chains.
  - *Trigger:* When working with Promises or any asynchronous function.
  - *Example (Preferred):*
    ```javascript
    async function fetchData() {
      try {
        const response = await fetch('/api/data');
        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    }
    ```
  - *Example (Discouraged):*
    ```javascript
    function fetchData() {
      fetch('/api/data')
        .then(response => response.json())
        .then(data => {
          console.log(data);
        })
        .catch(error => {
          console.error('Failed to fetch data:', error);
        });
    }
    ```
- **Avoid .then() chains:** Refrain from using lengthy `.then()` chains for managing sequences of asynchronous tasks. Convert such logic to use `async/await`.
