import _ from 'lodash';
import React, { Component } from 'react';
import {inject, observer} from 'mobx-react';

import dumbBem from 'dumb-bem';
import tx from 'transform-props-with';

import './App.css';


let dumbApp = dumbBem('app');
let AppWrapper = tx(dumbApp)('div');

let Header = tx([{ element: 'header' }, dumbApp])('div');
let Limit = tx([{ element: 'limit' }, dumbApp])('div');

let Grid = tx([{ element: 'grid' }, dumbApp])('div');
let Cell = tx([{ element: 'cell' }, dumbApp])('div');
let MinMax = tx([{ element: 'min-max' }, dumbApp])('div');
let Input = tx([{ element: 'input' }, dumbApp])('input');
let Row = tx([{ element: 'row' }, dumbApp])('div');

let NavButton = tx([{ element: 'nav-btn' }, dumbApp])('div');

let DeletedColumns = tx([{ element: 'deleted-columns' }, dumbApp])('div');
let DeletedColumn = tx([{ element: 'deleted-column' }, dumbApp])('button');

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sortBy: undefined,
      orderDirection: true,
      grouped: false,
      limit: 10,
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
      ],
      closedColumns: []
    }

    _.bindAll(this, [
      'setFilterMin',
      'setFilterMax',
      'renderCompnies',
      'setOrderBy',
      'setLimit',
      'setFilter',
      'moveLeft',
      'moveRight',
      'closeColumn',
      'restoreColumn'
    ]);
  }

  componentDidMount() {
    this.props.stores.companiesStore.fetch({limit: this.state.limit});
  }

  render() {
    let gridStyle = {
      gridTemplateColumns: '1fr '.repeat(this.state.columns.length)
    };
    return (
      <AppWrapper>
        <Header>
          <Limit>
            <span>Limit:</span>
            <input placeholder='Limit:' defaultValue={this.state.limit} onChange={(event) => this.setLimit(event.target.value)} />
          </Limit>
          <button
            onClick={() => this.setState({grouped: !this.state.grouped})}
          >{this.state.grouped ? 'Ungroup' : 'Group by company'}</button>
          <DeletedColumns>
            {
              this.state.closedColumns.map((column, id) => (
                <DeletedColumn onClick={() => this.restoreColumn(id)} key={id}>{column.name}</DeletedColumn>
              ))
            }
          </DeletedColumns>
        </Header>

        <Grid style={gridStyle}>
          {
            this.state.columns.map((field, id) => (
              <Cell
                modifier='header'
                key={`title${id}`}
              > 
                <Row modifier='between'>
                  <NavButton onClick={() => this.moveLeft(id)}>{'<'}</NavButton>
                  <NavButton onClick={() => this.closeColumn(id)}>X</NavButton>
                  <NavButton onClick={() => this.moveRight(id)}>{'>'}</NavButton>
                </Row>
                <span onClick={() => this.setOrderBy(field.name)}>{field.name}</span>
              </Cell>
            ))
          }
          {
            this.state.columns.map((field, id) => (
              <Cell
                key={`filter${id}`}
              >
                {
                  field.type === 'number' ? (
                    <MinMax>
                      <Input placeholder='from' onChange={(event) => this.setFilterMin(field, event.target.value)} />
                      <Input placeholder='to' onChange={(event) => this.setFilterMax(field, event.target.value)} />
                    </MinMax>
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

  setLimit(limit) {
    let limitNumber = parseInt(limit, 10);

    if (_.isNaN(limitNumber)) {
      limitNumber = undefined;
    }

    this.setState({limitNumber});
    this.props.stores.companiesStore.fetch({limit: limitNumber});
  }

  renderCompnies() {
    let companiesInfo = this.props.stores.companiesStore.table({
      sortBy: this.state.sortBy,
      orderDirection: this.state.orderDirection,
      filters: this.state.filters
    });

    if (this.state.grouped) {
      console.log(_.groupBy(companiesInfo, 'Title'));
    }

    return companiesInfo.map((infoRow, id1) => {
      return (
        <React.Fragment key={`${infoRow.Title}${id1}`}> 
          {
            this.state.columns.map((cell, id2) => (
              <Cell
                modifier='text'
                key={`${infoRow.Title}${id1}${id2}`}
              >{_.isNaN(infoRow[cell.name]) ? '' : infoRow[cell.name]}</Cell>
            ))
          }
        </React.Fragment>
      )
    });
  }

  moveLeft(id) {
    let columns = [...this.state.columns];

    if (id-1 < 0) return;    

    let mem = columns[id];
    columns[id] = columns[id-1];
    columns[id-1] = mem;

    this.setState({columns});
  }

  moveRight(id) {
    let columns = this.state.columns;

    if (id+1 > columns.length-1) return;
    
    let mem = columns[id];
    columns[id] = columns[id+1];
    columns[id+1] = mem;

    this.setState({columns});
  }

  closeColumn(id) {
    let columns = [...this.state.columns];
    let closedColumns = this.state.closedColumns;

    this.setState({
      columns,
      closedColumns: [{...columns.splice(id, 1)[0], id}, ...closedColumns]
    });
  }

  restoreColumn(id) {
    let closedColumns = [...this.state.closedColumns];
    let columns = [...this.state.columns];
    let column = closedColumns.splice(id, 1)[0];
    let newColumnId = column.id < columns.length ? column.id : columns.length;
    columns.splice(newColumnId, 0, {name: column.name, type: column.type});

    this.setState({
      columns,
      closedColumns
    });
  }
}

export default inject('stores')(observer(App));
