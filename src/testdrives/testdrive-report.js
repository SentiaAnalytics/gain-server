//@flow weak
import React from 'react'
import D from 'date-fp'
import {renderToStaticMarkup} from 'react-dom/server'

export default testdrive =>
  renderToStaticMarkup(<Report {...testdrive} />)


const Report = testdrive =>
  <html>
    <head>
      <title>Testdrive</title>
    </head>
    <body style={styles.body}>
      <div style={styles.row}>
        <h1>Testdrive</h1>
      </div>
      <div style={styles.row}>
        <div style={styles.box}>
          <h3>Vihicle</h3>
          <p>Brand: {testdrive.carBrand}</p>
          <p>Model:{testdrive.carModel}</p>
        </div>
        <div style={styles.box}>
          <h3>Trial Period</h3>
          <p>Date: {D.format('DD/MM/YYYY', new Date(testdrive.date))}</p>
        </div>
      </div>
    </body>
  </html>


const styles = {
  body: {
    fontFamily: 'Verdana, sans-serif'
  },
  row: {
    display: 'flex'
  },
  box: {
    flexGrow: 1,
    margin: 15,
    padding: 15,
    border: '1px solid black',
    borderRadius: 2
  },
}
