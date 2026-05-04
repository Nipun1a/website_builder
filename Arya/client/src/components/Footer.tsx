
const Footer = () => {
  return (
    <footer className='bg-gray-900 border-t border-gray-800 mt-24'>
      <div className='max-w-6xl mx-auto px-4 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          <div className='col-span-1 md:col-span-2'>
            <h3 className='text-xl font-bold text-white mb-4'>Arya Website Builder</h3>
            <p className='text-gray-400 mb-4'>
              Create stunning websites with ease. Our AI-powered platform helps you build professional sites in minutes.
            </p>
            <div className='flex space-x-4'>
              <a href='#' className='text-gray-400 hover:text-white transition-colors'>
                <i className='fab fa-twitter text-lg'></i>
              </a>
              <a href='#' className='text-gray-400 hover:text-white transition-colors'>
                <i className='fab fa-github text-lg'></i>
              </a>
              <a href='#' className='text-gray-400 hover:text-white transition-colors'>
                <i className='fab fa-linkedin text-lg'></i>
              </a>
            </div>
          </div>
          <div>
            <h4 className='text-lg font-semibold text-white mb-4'>Product</h4>
            <ul className='space-y-2'>
              <li><a href='#' className='text-gray-400 hover:text-white transition-colors'>Features</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition-colors'>Pricing</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition-colors'>Templates</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition-colors'>Integrations</a></li>
            </ul>
          </div>
          <div>
            <h4 className='text-lg font-semibold text-white mb-4'>Support</h4>
            <ul className='space-y-2'>
              <li><a href='#' className='text-gray-400 hover:text-white transition-colors'>Documentation</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition-colors'>Help Center</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition-colors'>Contact Us</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition-colors'>Community</a></li>
            </ul>
          </div>
        </div>
        <div className='border-t border-gray-800 mt-8 pt-8 text-center'>
          <p className='text-gray-400 text-sm'>
            © 2024 Arya Website Builder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
