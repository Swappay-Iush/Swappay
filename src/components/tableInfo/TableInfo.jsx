import "./TableInfo.css"

/**
 * columns: Array de objetos { label: string, key: string, render?: (row, idx) => ReactNode }
 * data: Array de objetos (filas)
 * emptyMessage: string opcional para mostrar si no hay datos
 * tableClassName: string opcional para clase de la tabla
 */
const TableInfo = ({ columns, data, emptyMessage = "No hay datos para mostrar.", tableClassName = "" }) => {
    return (
        <div className="tableinfo-wrapper">
            <table className={tableClassName}>
                <thead>
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx}>{col.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data && data.length > 0 ? (
                        data.map((row, rowIdx) => (
                            <tr key={rowIdx}>
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx}>
                                        {col.render ? col.render(row, rowIdx) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} style={{ textAlign: "center" }}>{emptyMessage}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TableInfo;