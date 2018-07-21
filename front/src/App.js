import _ from 'lodash';
import React, { Component } from 'react';
import {inject, observer} from 'mobx-react';

import dumbBem from 'dumb-bem';
import tx from 'transform-props-with';

import './App.css';


let dumbApp = dumbBem('app');
let AppWrapper = tx(dumbApp)('div');

let Grid = tx([{ element: 'grid' }, dumbApp])('div');
let Cell = tx([{ element: 'cell' }, dumbApp])('div');
let Row = tx([{ element: 'row' }, dumbApp])('div');
let Input = tx([{ element: 'input' }, dumbApp])('input');


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sortBy: undefined,
      orderDirection: true,
      filters: {},
      columns: [
        {name: 'Title', type: 'string'},
        {name: 'AP', type: 'number'},
        {name: 'CPV', type: 'number'},
        {name: 'CR', type: 'number'},
        {name: 'CTR', type: 'number'},
        {name: 'CV', type: 'number'},
        {name: 'Clicks', type: 'number'},
        {name: 'Conversion Cap', type: 'number'},
        {name: 'Conversions', type: 'number'},
        {name: 'Conversions as Counted for Conversion Cap', type: 'number'},
        {name: 'Cost', type: 'number'},
        {name: 'Country', type: 'string'},
        {name: 'EPC', type: 'number'},
        {name: 'EPV', type: 'number'},
        {name: 'Errors', type: 'number'},
        {name: 'Lander', type: 'string'},
        {name: 'Offer', type: 'string'},
        {name: 'Profit', type: 'number'},
        {name: 'ROI', type: 'number'},
        {name: 'Revenue', type: 'number'},
        {name: 'Visits', type: 'number'}
      ]
    }

    _.bindAll(this, [
      'setFilterMin',
      'setFilterMax',
      'renderCompnies',
      'setOrderBy',
      'setFilter'
    ]);
  }

  componentDidMount() {
    this.props.stores.companiesStore.fetch();
  }

  render() {
    return (
      <AppWrapper>
        <Grid>
          {
            this.state.columns.map((field, id) => (
              <Cell
                modifier='header'
                key={`title${id}`}
                onClick={() => this.setOrderBy(field.name)}
              >{field.name}</Cell>
            ))
          }
          {
            this.state.columns.map((field, id) => (
              <Cell
                key={`filter${id}`}
              >
                {
                  field.type === 'number' ? (
                    <Row>
                      <Input placeholder='from' onChange={(event) => this.setFilterMin(field, event.target.value)} />
                      <Input placeholder='to' onChange={(event) => this.setFilterMax(field, event.target.value)} />
                    </Row>
                  ) : (
                    <Input onChange={(event) => this.setFilter(field, event.target.value)} />
                  )
                }
              </Cell>
            ))
          }
          {this.renderCompnies()}
        </Grid>
      </AppWrapper>
    );
  }

  setFilterMin(field, filterValue) {
    let filters = this.state.filters;

    if (filterValue) {
      filters[field.name] = {
        type: field.type,
        ...filters[field.name],
        min: parseFloat(filterValue)
      }
    } else {
      delete filters[field.name].min;
    }

    this.setState({filters});
  }

  setFilterMax(field, filterValue) {
    let filters = this.state.filters;

    if (filterValue) {
      filters[field.name] = {
        type: field.type,
        ...filters[field.name],
        max: parseFloat(filterValue)
      }
    } else {
      delete filters[field.name].max;
    }

    this.setState({filters});
  }

  setFilter(field, filterValue) {
    let filters = this.state.filters;

    if (filterValue) {
      filters[field.name] = {
        type: field.type,
        value: filterValue
      };
    } else {
      delete filters[field.name];
    }

    this.setState({filters});
  }

  setOrderBy(title) {
    this.setState({
      sortBy: title,
      orderDirection: title === this.state.sortBy ? !this.state.orderDirection : true
    });
  }

  renderCompnies() {
    let companiesInfo = this.props.stores.companiesStore.table({
      sortBy: this.state.sortBy,
      orderDirection: this.state.orderDirection,
      filters: this.state.filters
    });

    return companiesInfo.map((infoRow, id1) => {
      return (
        <React.Fragment key={`${infoRow.Title}${id1}`}> 
          {
            this.state.columns.map((cell, id2) => (
              <Cell key={`${infoRow.Title}${id1}${id2}`}>{_.isNaN(infoRow[cell.name]) ? '' : infoRow[cell.name]}</Cell>
            ))
          }
        </React.Fragment>
      )
    });
  }
}

export default inject('stores')(observer(App));
