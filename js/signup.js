// signup.js -> signup page, allows user to create an account
  

//using the FETCH API calls from server.js 

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#signup-form');

    if(!form){
        console.error('Signup form not found!');
        return;
    }

    form.addEventListener('submit', async(e) => {
        e.preventDefault();

        const name = document.querySelector('#name').value.trim();
        const email = document.querySelector('#email').value.trim();
        const password = document.querySelector('#password').value.trim();
        const confirm = document.querySelector('#confirm').value.trim();

        // safe guard - checks if all the fields are filled 
        if(!name || !email || !password || !confirm) {
            alert('Please fill in all the given fields.');
            return;
        }

        // safe guard: check that the passwords match 
        if(password != confirm){
            alert('Passwords do not match.');
            return;
        }

        console.log('Attempting to signup with: ', email);

        try {
            const response = await fetch('http://localhost:3000/api/signup', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password})
            });

            const data = await response.json();
            console.log('Signup process:', data);

            if(data.success){
                localStorage.setItem('user', JSON.stringify(data.user));
                alert('Account created successfully!');
                window.location.href = 'index.html';

            } else {
                alert(data.message || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('Error connecting to the server');
        }
    });
});