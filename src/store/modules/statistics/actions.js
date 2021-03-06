export default {
  incrementGeneratedRows({ commit }, nrOfRows) {
    commit('incrementGeneratedRows', nrOfRows);
  },
  incrementErrors({ commit }) {
    commit('incrementErrors');
  },
  incrementGeneratedDatabase({ commit }) {
    commit('incrementGeneratedDatabase');
  },
  recalculateFieldsPerTable({ commit }, payload) {
    var avgFields;
    var nrOfTables = 0;
    var nrOfFields = 0;

    payload.forEach(schema => {
      nrOfTables = nrOfTables + schema.tables.length;
      schema.tables.forEach(table => {
        nrOfFields = nrOfFields + table.fields.length;
      });
    });

    avgFields = Math.floor((nrOfFields / nrOfTables) * 100) / 100;

    commit('setFieldsPerTable', avgFields);
  },
  setSchemasBarData({ commit }, payload) {
    let data = {
      labels: [],
      series: [[], []]
    };
    var nrOfFields = 0;

    payload.forEach(schema => {
      data.labels.push(schema.name);

      nrOfFields = 0;
      schema.tables.forEach(table => {
        nrOfFields = nrOfFields + table.fields.length;
      });

      data.series[0].push(schema.tables.length);
      data.series[1].push(nrOfFields);
    });

    commit('setSchemasBarData', data);
  },
  setConnectionsPieData({ commit }, payload) {
    let data = {
      labels: [],
      series: []
    };

    payload.forEach(connetion => {
      var connectionIndex = -1;

      connectionIndex = data.labels.indexOf(connetion.database);
      if (connectionIndex === -1) {
        data.labels.push(connetion.database);
        data.series.push(1);
      } else {
        data.series[connectionIndex]++;
      }
    });

    commit('setConnectionsPieData', data);
  },
  setGeneratedHBarData({ commit, state }, payload) {
    let data = state.statistics.generatedHBar.data;
    var schemaIndex;
    var generatedRows;

    schemaIndex = data.labels.indexOf(payload.name);
    generatedRows = schemaGeneratedRows(payload.tables, payload.multiplicator);
    if (schemaIndex === -1) {
      data.labels.push(payload.name);
      data.series[0].push(generatedRows);
    } else {
      data.series[0][schemaIndex] += generatedRows;
    }

    commit('incrementGeneratedRows', generatedRows);
    commit('setGeneratedHBar', data);
    commit('incrementGeneratedDatabase');
  }
};

function schemaGeneratedRows(tables, schemaMultiplicator) {
  var schemaGeneratedRows = 0;
  tables.forEach(table => {
    schemaGeneratedRows =
      schemaGeneratedRows +
      schemaMultiplicator * tableMultiplicator(tables, table.name);
  });
  return schemaGeneratedRows;
}
function tableMultiplicator(tables, tableName) {
  var multiplicator = 1;
  var table = tables.find(table => {
    return table.name === tableName;
  });

  multiplicator = multiplicator * table.multiplicator;

  if (table.refs.length) {
    table.refs.forEach(ref => {
      multiplicator = multiplicator * tableMultiplicator(tables, ref);
    });
  }
  return multiplicator;
}
