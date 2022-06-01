import axios from 'axios';

export default axios.create({
  baseURL: 'https://as-fincorp-guestbook-prod.azurewebsites.net',
  headers: {
    'Content-type': 'application/json',
  },
});
