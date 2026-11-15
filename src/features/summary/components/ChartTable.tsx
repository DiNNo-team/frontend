interface ChartTableProps {
  caption: string
  headers: [string, string]
  rows: { label: string; value: string | number }[]
}

/** The table that backs a chart, for screen readers: the same numbers, in words, in reading order. */
export function ChartTable({ caption, headers, rows }: ChartTableProps) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{headers[0]}</th>
          <th scope="col">{headers[1]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
