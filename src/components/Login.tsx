import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './style.css';

export default function Login() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/Authontication/login`, {
        userName: username,
        password: password,
      });

      // Assuming the response contains user data like a token or user details
      localStorage.setItem('user', JSON.stringify(response.data));
      console.log(localStorage)
      // Redirect to the dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <div className='main-container w-[498px] h-[685px] text-[0px] bg-[#fffefc] relative overflow-hidden mx-auto my-0'>
      <span className="block h-[48px] font-['Poppins'] text-[32px] font-normal leading-[48px] text-[#000] relative text-left whitespace-nowrap mt-[79px] mr-0 mb-0 ml-[173px]">
        Bienvenue
      </span>
      <form className='flex w-[400px] flex-col gap-[8px] items-start flex-nowrap relative z-[1] mt-[76px] mr-0 mb-0 ml-[49px]' onSubmit={handleLogin}>
        <div className='flex w-[400px] pt-[25px] pr-[25px] pb-[25px] pl-[25px] flex-col gap-[25px] items-start shrink-0 flex-nowrap bg-[#fff] rounded-[6px] border-solid border border-[#e2e8f0] relative z-[2]'>
          <div className='flex w-[350px] flex-col gap-[16px] items-start shrink-0 flex-nowrap relative z-[3]'>
            <span className="flex w-[350px] h-[20px] justify-start items-start shrink-0 basis-auto font-['Inter'] text-[14px] font-normal leading-[20px] text-[#64748b] relative text-left whitespace-nowrap z-[4]">
              Entrez votre nom d'utilisateur et mot de passe
            </span>

            <div className='flex w-[350px] flex-col gap-[8px] items-start shrink-0 flex-nowrap relative z-[5]'>
              <div className='flex flex-col gap-[6px] items-start shrink-0 flex-nowrap relative z-[6]'>
                <label className="h-[20px] shrink-0 basis-auto font-['Inter'] text-[14px] font-medium leading-[20px] text-[#0f172a] relative text-left whitespace-nowrap z-[7]">
                  Nom d'utilisateur
                </label>
                <div className='flex gap-[8px] items-start self-stretch shrink-0 flex-nowrap relative overflow-hidden z-[8]'>
                  <input
                    type="text"
                    name="username"
                    placeholder="Nom d'utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className='w-[350px] pt-[8px] pr-[56px] pb-[8px] pl-[12px] bg-[#fff] rounded-[6px] border-solid border border-[#cbd5e1] relative box-content z-10 font-["Inter"] text-[14px] leading-[20px] text-[#0f172a]'
                  />
                </div>
              </div>

              <div className='flex flex-col gap-[6px] items-start shrink-0 flex-nowrap relative z-[13]'>
                <label className="h-[20px] shrink-0 basis-auto font-['Inter'] text-[14px] font-medium leading-[20px] text-[#0f172a] relative text-left whitespace-nowrap z-[14]">
                  Mot de passe
                </label>
                <div className='flex gap-[8px] items-start self-stretch shrink-0 flex-nowrap relative overflow-hidden z-[15]'>
                  <input
                    type="password"
                    name="password"
                    placeholder="**********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='w-[350px] pt-[8px] pr-[56px] pb-[8px] pl-[12px] bg-[#fff] rounded-[6px] border-solid border border-[#cbd5e1] relative box-content z-10 font-["Inter"] text-[14px] leading-[20px] text-[#94a3b8]'
                  />
                </div>
              </div>
            </div>

            <button className='flex pt-[8px] pr-[16px] pb-[8px] pl-[16px] gap-[10px] justify-center items-center shrink-0 flex-nowrap bg-[#2563eb] rounded-[6px] border-none relative z-20 pointer'>
              <span className="h-[24px] shrink-0 basis-auto font-['Inter'] text-[14px] font-medium leading-[24px] text-[#fff] relative text-left whitespace-nowrap z-[21]">
                Se connecter
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
