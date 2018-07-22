import _ from 'lodash';
import React, { Component } from 'react';
import {inject, observer} from 'mobx-react';

import dumbBem from 'dumb-bem';
import tx from 'transform-props-with';

import ReactTooltip from 'react-tooltip';

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
let GroupByBtn = tx([{ element: 'group-by-btn' }, dumbApp])('button');

let DeletedColumnsWrp = tx([{ element: 'deleted-columns-wrapper' }, dumbApp])('div');
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
      'renderCompnies',
      'renderRowsGroup',
      'setRangeFilter',
      'setTextFilter',
      'setOrderBy',
      'setLimit',
      'move',
      'closeColumn',
      'restoreColumn',
      'getColumns',
      'groupByTitle'
    ]);
  }

  componentDidMount() {
    this.props.stores.companiesStore.fetch({limit: this.state.limit});
  }

  render() {
    let columns = this.getColumns();

    return (
      <AppWrapper>
        <Header>
          <Limit>
            <span>Limit:</span>
            <input placeholder='Limit:' defaultValue={this.state.limit} onChange={(event) => this.setLimit(event.target.value)} />
          </Limit>
          <GroupByBtn
            onClick={() => this.groupByTitle()}
          >{this.state.grouped ? 'Ungroup' : 'Group by company'}</GroupByBtn>
          {
            this.state.closedColumns.length !== 0 &&
            <DeletedColumnsWrp>
              <h1>Restore columns</h1>
              <DeletedColumns>
                {
                  this.state.closedColumns.map((column, id) => (
                    <DeletedColumn onClick={() => this.restoreColumn(id)} key={id}>{column.name}</DeletedColumn>
                  ))
                }
              </DeletedColumns>
            </DeletedColumnsWrp>
          }
        </Header>

        <Grid style={{gridTemplateColumns: `repeat(${columns.length}, 1fr)`}}>
          {
            columns.map((field, id) => (
              <Cell
                modifier='header'
                key={`title${id}`}
              > 
                <Row modifier='between'>
                  <NavButton onClick={() => this.move(id, 'left')}>{'<'}</NavButton>
                  <NavButton onClick={() => this.closeColumn(id)}>X</NavButton>
                  <NavButton onClick={() => this.move(id, 'right')}>{'>'}</NavButton>
                </Row>
                <span onClick={() => this.setOrderBy(field.name)}>{field.name}</span>
              </Cell>
            ))
          }
          {
            columns.map((field, id) => (
              <Cell
                key={`filter${id}`}
              >
                {
                  field.type === 'number' ? (
                    <MinMax>
                      <Input placeholder='from' onChange={(event) => this.setRangeFilter(field, event.target.value, 'min')} />
                      <Input placeholder='to' onChange={(event) => this.setRangeFilter(field, event.target.value, 'max')} />
                    </MinMax>
                  ) : (
                    <Input onChange={(event) => this.setTextFilter(field, event.target.value)} />
                  )
                }
              </Cell>
            ))
          }
          {this.renderCompnies(columns)}
        </Grid>
      </AppWrapper>
    );
  }

  renderCompnies(columns) {
    let companies = this.props.stores.companiesStore.companies;
    let companiesInfo = this.props.stores.companiesStore.table({
      sortBy: this.state.sortBy,
      orderDirection: this.state.orderDirection,
      filters: this.state.filters,
      groupByTitle: this.state.grouped
    });

    if (this.state.grouped) {
      return _.map(companies, (company) => {
        return (
          <React.Fragment key={company.title}>
            <Cell
              modifier='title'
              style={{gridColumn: '1 / -1'}}
              onClick={() => company.trigger()}
            >{company.title}</Cell>
            {company.isExpanded && this.renderRowsGroup(companiesInfo[company.title], columns)}
          </React.Fragment>
        )
      })
    }

    return this.renderRowsGroup(companiesInfo, columns);
  }

  renderRowsGroup(rows, columns) {
    if (!rows) return <Cell style={{gridColumn: '1 / -1'}} />;
    return rows.map((infoRow, id1) => {
      return (
        <React.Fragment key={`${infoRow.Title}${id1}`}> 
          {
            columns.map((cell, id2) => {
              let text = _.isNaN(infoRow[cell.name]) ? '' : infoRow[cell.name];
              return (
                <Cell
                  data-tip={text}
                  data-delay-show='600'
                  modifier='text'
                  key={`${infoRow.Title}${id1}${id2}`}
                >{text}</Cell>
              )
            })
          }
          <ReactTooltip />
        </React.Fragment>
      )
    });
  }

  setRangeFilter(field, filterValue, rangeBorderType = 'min') {
    let filters = this.state.filters;

    if (filterValue) {
      filters[field.name] = {
        type: field.type,
        ...filters[field.name],
        [rangeBorderType]: parseFloat(filterValue)
      }
    } else {
      delete filters[field.name][rangeBorderType];
    }

    this.setState({filters});
  }

  setTextFilter(field, filterValue) {
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

  move(id, direction = 'left') {
    let diff = direction === 'left' ? -1 : 1;

    let columns = [...this.getColumns()];

    if (direction === 'right' && id+1 > columns.length-1) return;
    if (direction === 'left' && id-1 < 0) return;

    let mem = columns[id];
    columns[id] = columns[id+(1*diff)];
    columns[id+(1*diff)] = mem;

    this.setState({columns});
  }

  closeColumn(id) {
    let columns = [...this.getColumns()];
    let closedColumns = this.state.closedColumns;

    this.setState({
      columns,
      closedColumns: [{...columns.splice(id, 1)[0], id}, ...closedColumns]
    });
  }

  restoreColumn(id) {
    let closedColumns = [...this.state.closedColumns];
    let columns = [...this.getColumns()];
    let column = closedColumns.splice(id, 1)[0];
    let newColumnId = column.id < columns.length ? column.id : columns.length;
    columns.splice(newColumnId, 0, {name: column.name, type: column.type});

    this.setState({
      columns,
      closedColumns
    });
  }

  groupByTitle() {
    let grouped = !this.state.grouped;
    let columns = [...this.state.columns];
    let closedColumns = [...this.state.closedColumns];

    if (grouped) {
      columns = _.reject(columns, {name: 'Title'});
    } else {
      columns.unshift({name: 'Title', type: 'string'});
      closedColumns = _.reject(closedColumns, {name: 'Title'});
    }

    this.setState({
      grouped,
      columns,
      closedColumns
    });
  }

  getColumns() {
    return this.state.columns;
  }
}

export default inject('stores')(observer(App));
