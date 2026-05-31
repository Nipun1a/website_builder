import { useState } from 'react';
import Footer from '../components/Footer';
import { toast } from 'sonner';
import api from '@/configs/axios';
import { authClient } from '@/lib/auth-client';
import { appPlans } from '../assets/assets';

interface Plan{
  id: string;
  name: string;
  price: string;
  credits: number;
  description: string;
  features: string[];
}

const Pricing = () => {
    const {data: session} = authClient.useSession();
    const [plans] = useState<Plan[]>(appPlans);

    const handlePurchase = async (planId:string) =>{
    try {
        if(!session?.user) return toast.error('Please login to purchase credits');
        const {data} = await api.post<{ payment_link: string }>('/api/user/purchase-credits', {planId});
        window.location.href = data.payment_link;
    } catch (error: any) {
        toast.error(error?.response?.data?.message || error.message);   
        console.log(error);
        
    }


  }
  return (
    <>
      <div className="relative isolate min-h-screen overflow-hidden text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-black"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAVc8B-8ftoYyS8s7T-Djsb1eUf7DEoKsTBesl-ZJX4kfh28doGwJE8OgwlkKNQwDP0rBJNF3HD97AvckDtMI7QpMgsiDdmJW3bLMICVv3MzWGvnI2oul_Kc5-ri9JihnNu0swpOzROrLYyDx2gf9s5YVLBqAyGWoz-MM-WR06gL7CUIPkWifI8y5o0lezck6fCLhtcRFGmsRmOMD-Mu2zfBsC-I-SW-NqShz7td-mIPdSE0gmyZijJfdNTMS4Rj4pVxqcSyfBMClHt')",
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover'
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(0,209,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.16),transparent_26%),linear-gradient(180deg,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0.68)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-40 bg-[linear-gradient(to_bottom,rgba(88,28,135,0.15)_0%,rgba(0,0,0,0)_100%)]"
        />

        <div className='relative w-full max-w-5xl mx-auto z-20 max-md:px-4 min-h-[80vh]'>
          <div className='text-center mt-16'>
            <h2 className='text-gray-100 text-3xl font-medium '>
             Choose Your Plan 
            </h2>
            <p className='text-gray-400 text-sm max-w-md mx-auto mt-2'>
              Start for free and scale up as you grow find the perfect plan for your content creation needs.

            </p>
          </div>
        
                  <div className='pt-14 py-4 px-4 '>
                      <div className='grid grid-cols-1 md:grid-cols-3 flex-wrap gap-4'>
                          {plans.map((plan, idx) => (
                              <div key={idx} className="p-6 bg-black/20 ring ring-indigo-950 mx-auto w-full max-w-sm rounded-lg text-white shadow-lg hover:ring-indigo-500 transition-all duration-400">
                                  <h3 className="text-xl font-bold">{plan.name}</h3>
                                  <div className="my-2">
                                      <span className="text-4xl font-bold">{plan.price}</span>
                                      <span className="text-gray-300"> / {plan.credits} credits</span>
                                  </div>

                                  <p className="text-gray-300 mb-6">{plan.description}</p>

                                  <ul className="space-y-1.5 mb-6 text-sm">
                                      {plan.features.map((feature, i) => (
                                          <li key={i} className="flex items-center">
                                              <svg className="h-5 w-5 text-indigo-300 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                  stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                              </svg>
                                              <span className="text-gray-400">{feature}</span>
                                          </li>
                                      ))}
                                  </ul>
                                  <button onClick={() => handlePurchase(plan.id)} className="w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-sm rounded-md transition-all">
                                      Buy Now
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
                  <p className='mx-auto text-center text-sm max-w-md mt-10 text-white font-light'>Project <span className='text-white'>Creation / Revision</span> consume <span className='text-white'>5 credits</span>. you can purchase more credit to create more projects.</p>
        </div>
            <Footer />
      </div>
      
    </>
  )
}

export default Pricing
