import _ from 'lodash';
import {types, flow, getRoot} from 'mobx-state-tree';

import {
  getCompanies,
  getCompany
} from 'rest';


function rowFilter(row, filters) {
    for (let cell in filters) {
        if (filters[cell].type === 'string') {
            if (row[cell].toLowerCase().indexOf(filters[cell].value.toLowerCase()) === -1) {
                return false;
            }
        }

        if (filters[cell].type === 'number') {
            if (filters[cell].min !== undefined && filters[cell].max !== undefined) {
                if (filters[cell].min > row[cell] || filters[cell].max < row[cell]) {
                    return false;
                }
            } else if (filters[cell].min !== undefined) {
                if (filters[cell].min > row[cell]) {
                    return false;
                }
            } else {
                if (filters[cell].max < row[cell]) {
                    return false;
                }
            }
        }
    }
    return true;
}


export let CompanyInfo = types
    .model('CompanyInfo', {
        AP: types.maybe(types.number),
        CPV: types.maybe(types.number),
        CR: types.maybe(types.number),
        CTR: types.maybe(types.number),
        CV: types.maybe(types.number),
        Clicks: types.maybe(types.number),
        'Conversion Cap': types.maybe(types.number),
        Conversions: types.maybe(types.number),
        'Conversions as Counted for Conversion Cap': types.maybe(types.number),
        Cost: types.maybe(types.number),
        Country: types.maybe(types.string),
        EPC: types.maybe(types.number),
        EPV: types.maybe(types.number),
        Errors: types.maybe(types.number),
        Lander: types.maybe(types.string),
        Offer: types.maybe(types.string),
        Profit: types.maybe(types.number),
        ROI: types.maybe(types.number),
        Revenue: types.maybe(types.number),
        Visits: types.maybe(types.number)
    })
    .preProcessSnapshot(snapshot => ({
        ...snapshot,
        AP: parseFloat(snapshot.AP),
        CPV: parseFloat(snapshot.CPV),
        CR: parseFloat(snapshot.CR),
        CTR: parseFloat(snapshot.CTR),
        CV: parseFloat(snapshot.CV),
        Clicks: parseFloat(snapshot.Clicks),
        'Conversion Cap': parseFloat(snapshot['Conversion Cap']),
        Conversions: parseFloat(snapshot.Conversions),
        'Conversions as Counted for Conversion Cap': parseFloat(snapshot['Conversions as Counted for Conversion Cap']),
        Cost: parseFloat(snapshot.Cost),
        EPC: parseFloat(snapshot.EPC),
        EPV: parseFloat(snapshot.EPV),
        Errors: parseFloat(snapshot.Errors),
        Profit: parseFloat(snapshot.Profit),
        ROI: parseFloat(snapshot.ROI),
        Revenue: parseFloat(snapshot.Revenue),
        Visits: parseFloat(snapshot.Visits)
    }));


export let Company = types
    .model('Company', {
        title: types.string,
        infoList: types.array(CompanyInfo)
    })
    .views(self => ({
        get table() {
            return self.infoList.map(row => ({...row, Title: self.title}));
        }
    }));


export let Companies = types
    .model('Companies', {
        companies: types.array(Company)
    })
    .views(self => ({
        table({sortBy, orderDirection, filters}) {
            let table = self.companies.reduce((tables, company) => [...tables, ...company.table], []);
            if (sortBy) {
                table = _.orderBy(table, sortBy, orderDirection ? 'asc' : 'desc');
            }
            if (!_.isEmpty(filters)) {
                table = _.filter(table, (row) => rowFilter(row, filters));
            }
            return table;
        }
    }))
    .actions(self => ({
        fetch: flow(function*({limit}) {
            self.companies = [];
            let companies = yield getRoot(self).fetch(() => getCompanies());

            for (let key in companies) {
                let companyTitle = companies[key];
                let companyInfo = yield getRoot(self).fetch(() => getCompany(companyTitle, limit));

                self.companies.push({
                    title: companyTitle,
                    infoList: companyInfo
                });
            }
            return self.companies;
        })
    }));
