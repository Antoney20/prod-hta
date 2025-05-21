import React from 'react'
import BenefitsForm from './form'
import Navbar from '../components/layouts/navbar'
import Footer from '../components/layouts/footer'

function page() {
  return (
    <div><Navbar/> <BenefitsForm/> <Footer/>  </div>
  )
}

export default page