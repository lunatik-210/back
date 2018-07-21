import axios from 'axios';
import config from 'config';

const COMPANY_LIST = `${config.apiUrl}/company/list`;
const COMPANY_VIEW = `${config.apiUrl}/company/view`;

export function getCompanies() {
  return axios.get(COMPANY_LIST)
    .then((data) => data.data, () => [])
}

export function getCompany(title, limit = 10) {
  return axios.get(COMPANY_VIEW, {
    params: {
      title,
      limit
    }
  }).then((data) => data.data, () => []);
}
