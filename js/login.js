// login.js -> user can login into their account and view their profile 

//using the FETCH API calls from server.js 

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    if(!form){
        console.error('Login form not found!');
        return;
    }

    form.addEventListener('submit', async(e) => {
        e.preventDefault();

        const email = document.querySelector('input[type="email"]').value.trim();
        const password = document.querySelector('input[type="password"]').value.trim();

        // safe gaurd: ensuring that the user entered in the email and password fields 
        if(!email || !password){
            alert('Please eneter both email and password.');
            return;
        }

        console.log('Attempting to login with: ', email);

        try{
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password})
            });

            const data = await response.json();
            console.log('Login response:', data);

            if(data.success){
                localStorage.setItem('user', JSON.stringify(data.user));
                alert('Login successful!');

                // Redirect user based on their role 
                if(data.user.role === 'admin'){
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Error connecting to the server');
        }
    });
});