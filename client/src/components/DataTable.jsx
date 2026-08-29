import React from 'react';

export default function DataTable({ columns, data }) {
  return (
    <div className="table-wrap">
      <table className="ch-table">
        <thead>
          <tr>
            {columns.map((c, i) => <th key={i}>{c.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map((c, j) => (
                <td key={j}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}