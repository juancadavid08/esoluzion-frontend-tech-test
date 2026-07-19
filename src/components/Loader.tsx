import React from 'react'

export default function Loader(){
  return (
    <div style={{padding:20,display:'flex',justifyContent:'center'}}>
      <div style={{width:36,height:36,borderRadius:18,border:'4px solid #eee',borderTopColor:'#1976d2',animation:'spin 1s linear infinite'}} />
      <style>{`@keyframes spin {to {transform:rotate(360deg)}}`}</style>
    </div>
  )
}
