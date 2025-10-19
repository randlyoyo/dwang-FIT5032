/**
 * Data Export Service
 * Supports multiple export formats: CSV, JSON, Excel, PDF-ready
 */

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

class ExportService {
  /**
   * Export data to CSV format
   * @param {Array} data - Array of objects to export
   * @param {string} filename - Output filename (without extension)
   * @param {Array} columns - Optional: specific columns to export
   */
  exportToCSV(data, filename = 'export', columns = null) {
    if (!data || data.length === 0) {
      throw new Error('No data to export')
    }

    try {
      // Filter columns if specified
      const processedData = columns
        ? data.map((row) => {
            const filteredRow = {}
            columns.forEach((col) => {
              filteredRow[col.label || col.key] = row[col.key]
            })
            return filteredRow
          })
        : data

      // Convert to CSV
      const headers = Object.keys(processedData[0])
      const csvContent = [
        headers.join(','), // Header row
        ...processedData.map((row) =>
          headers
            .map((header) => {
              const cell = row[header]
              // Handle special characters and quotes
              const cellStr = cell !== null && cell !== undefined ? String(cell) : ''
              return cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')
                ? `"${cellStr.replace(/"/g, '""')}"`
                : cellStr
            })
            .join(','),
        ),
      ].join('\n')

      // Create blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      saveAs(blob, `${filename}.csv`)

      return { success: true, filename: `${filename}.csv`, rowCount: data.length }
    } catch (error) {
      console.error('CSV export error:', error)
      throw new Error(`Failed to export CSV: ${error.message}`)
    }
  }

  /**
   * Export data to JSON format
   * @param {Array|Object} data - Data to export
   * @param {string} filename - Output filename (without extension)
   * @param {boolean} pretty - Pretty print JSON
   */
  exportToJSON(data, filename = 'export', pretty = true) {
    if (!data) {
      throw new Error('No data to export')
    }

    try {
      const jsonContent = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data)

      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
      saveAs(blob, `${filename}.json`)

      const rowCount = Array.isArray(data) ? data.length : 1
      return { success: true, filename: `${filename}.json`, rowCount }
    } catch (error) {
      console.error('JSON export error:', error)
      throw new Error(`Failed to export JSON: ${error.message}`)
    }
  }

  /**
   * Export data to Excel format (.xlsx)
   * @param {Array} data - Array of objects to export
   * @param {string} filename - Output filename (without extension)
   * @param {string} sheetName - Worksheet name
   * @param {Array} columns - Optional: specific columns to export
   */
  exportToExcel(data, filename = 'export', sheetName = 'Sheet1', columns = null) {
    if (!data || data.length === 0) {
      throw new Error('No data to export')
    }

    try {
      // Filter columns if specified
      const processedData = columns
        ? data.map((row) => {
            const filteredRow = {}
            columns.forEach((col) => {
              filteredRow[col.label || col.key] = row[col.key]
            })
            return filteredRow
          })
        : data

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(processedData)

      // Auto-size columns
      const colWidths = []
      const headers = Object.keys(processedData[0])
      headers.forEach((header, i) => {
        const maxLength = Math.max(
          header.length,
          ...processedData.map((row) => String(row[header] || '').length),
        )
        colWidths[i] = { wch: Math.min(maxLength + 2, 50) } // Max width 50
      })
      ws['!cols'] = colWidths

      // Create workbook
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, sheetName)

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      saveAs(blob, `${filename}.xlsx`)

      return { success: true, filename: `${filename}.xlsx`, rowCount: data.length }
    } catch (error) {
      console.error('Excel export error:', error)
      throw new Error(`Failed to export Excel: ${error.message}`)
    }
  }

  /**
   * Export data to multiple sheets in Excel
   * @param {Array} sheets - Array of {name, data} objects
   * @param {string} filename - Output filename (without extension)
   */
  exportToExcelMultiSheet(sheets, filename = 'export') {
    if (!sheets || sheets.length === 0) {
      throw new Error('No sheets to export')
    }

    try {
      const wb = XLSX.utils.book_new()

      sheets.forEach((sheet) => {
        if (!sheet.data || sheet.data.length === 0) {
          console.warn(`Sheet "${sheet.name}" has no data, skipping`)
          return
        }

        const ws = XLSX.utils.json_to_sheet(sheet.data)

        // Auto-size columns
        const headers = Object.keys(sheet.data[0])
        const colWidths = headers.map((header) => {
          const maxLength = Math.max(
            header.length,
            ...sheet.data.map((row) => String(row[header] || '').length),
          )
          return { wch: Math.min(maxLength + 2, 50) }
        })
        ws['!cols'] = colWidths

        XLSX.utils.book_append_sheet(wb, ws, sheet.name)
      })

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      saveAs(blob, `${filename}.xlsx`)

      const totalRows = sheets.reduce((sum, sheet) => sum + (sheet.data?.length || 0), 0)
      return {
        success: true,
        filename: `${filename}.xlsx`,
        sheetCount: sheets.length,
        totalRows,
      }
    } catch (error) {
      console.error('Multi-sheet Excel export error:', error)
      throw new Error(`Failed to export multi-sheet Excel: ${error.message}`)
    }
  }

  /**
   * Export data as PDF-ready HTML
   * @param {Array} data - Array of objects to export
   * @param {string} title - Document title
   * @param {Array} columns - Optional: specific columns to export
   */
  exportToPDFReady(data, title = 'Data Export', columns = null) {
    if (!data || data.length === 0) {
      throw new Error('No data to export')
    }

    try {
      // Filter columns if specified
      const displayColumns = columns || Object.keys(data[0]).map((key) => ({ key, label: key }))

      // Generate HTML table
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            font-size: 12px;
        }
        h1 {
            text-align: center;
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #4CAF50;
            color: white;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        tr:hover {
            background-color: #ddd;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Total Records:</strong> ${data.length}</p>

    <table>
        <thead>
            <tr>
                ${displayColumns.map((col) => `<th>${col.label || col.key}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${data
              .map(
                (row) => `
                <tr>
                    ${displayColumns
                      .map((col) => {
                        const value = row[col.key]
                        return `<td>${value !== null && value !== undefined ? value : ''}</td>`
                      })
                      .join('')}
                </tr>
            `,
              )
              .join('')}
        </tbody>
    </table>

    <div class="footer">
        <p>Healthy Recipe Hub - Data Export</p>
        <p>Print this page or save as PDF using your browser's print function (Ctrl+P)</p>
    </div>
</body>
</html>
            `

      // Open in new window for printing
      const printWindow = window.open('', '_blank')
      printWindow.document.write(html)
      printWindow.document.close()

      return { success: true, message: 'PDF-ready HTML opened in new window' }
    } catch (error) {
      console.error('PDF-ready export error:', error)
      throw new Error(`Failed to generate PDF-ready HTML: ${error.message}`)
    }
  }

  /**
   * Export filtered and sorted data
   * @param {Array} data - Original data
   * @param {Object} options - Export options
   */
  exportWithOptions(data, options = {}) {
    const {
      format = 'csv',
      filename = 'export',
      columns = null,
      filters = null,
      sortBy = null,
      sortOrder = 'asc',
    } = options

    try {
      let processedData = [...data]

      // Apply filters
      if (filters && Object.keys(filters).length > 0) {
        processedData = processedData.filter((row) => {
          return Object.entries(filters).every(([key, value]) => {
            if (value === '' || value === null || value === undefined) return true
            return String(row[key]).toLowerCase().includes(String(value).toLowerCase())
          })
        })
      }

      // Apply sorting
      if (sortBy) {
        processedData.sort((a, b) => {
          const aVal = a[sortBy]
          const bVal = b[sortBy]
          if (aVal === bVal) return 0
          const comparison = aVal > bVal ? 1 : -1
          return sortOrder === 'asc' ? comparison : -comparison
        })
      }

      // Export based on format
      switch (format.toLowerCase()) {
        case 'csv':
          return this.exportToCSV(processedData, filename, columns)
        case 'json':
          return this.exportToJSON(processedData, filename)
        case 'excel':
        case 'xlsx':
          return this.exportToExcel(processedData, filename, 'Data', columns)
        case 'pdf':
          return this.exportToPDFReady(processedData, filename, columns)
        default:
          throw new Error(`Unsupported format: ${format}`)
      }
    } catch (error) {
      console.error('Export with options error:', error)
      throw error
    }
  }

  /**
   * Get export statistics
   * @param {Array} data - Data to analyze
   */
  getExportStats(data) {
    if (!data || data.length === 0) {
      return {
        totalRecords: 0,
        columns: [],
        estimatedSize: {
          csv: '0 KB',
          json: '0 KB',
          excel: '0 KB',
        },
      }
    }

    const columns = Object.keys(data[0])
    const jsonSize = new Blob([JSON.stringify(data)]).size
    const csvSize = jsonSize * 0.7 // Rough estimate
    const excelSize = jsonSize * 1.2 // Excel is slightly larger

    return {
      totalRecords: data.length,
      columns: columns,
      columnCount: columns.length,
      estimatedSize: {
        csv: this.formatBytes(csvSize),
        json: this.formatBytes(jsonSize),
        excel: this.formatBytes(excelSize),
      },
    }
  }

  /**
   * Format bytes to human-readable size
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }
}

export default new ExportService()
