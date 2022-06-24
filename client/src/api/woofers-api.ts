import { apiEndpoint } from '../config'
import { Woofer } from '../types/Woofer';
import { CreateWooferRequest } from '../types/CreateWooferRequest';
import Axios from 'axios'
import { UpdateWooferRequest } from '../types/UpdateWooferRequest';

export const getWoofers= async (idToken: string): Promise<Woofer[]> => {
  console.log('Fetching Woofers')

  const response = await Axios.get(`${apiEndpoint}/woofers`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Woofers:', response.data)
  return response.data.items
}

export const createWoofer = async (
  idToken: string,
  newWoofer: CreateWooferRequest
): Promise<Woofer> => {
  const response = await Axios.post(`${apiEndpoint}/woofers`,  JSON.stringify(newWoofer), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export const patchWoofer = async(
  idToken: string,
  wooferId: string,
  updatedWoofer: UpdateWooferRequest
): Promise<void> => {
  await Axios.patch(`${apiEndpoint}/woofers/${wooferId}`, JSON.stringify(updatedWoofer), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export const deleteWoofer = async(
  idToken: string,
  wooferId: string
): Promise<void> => {
  await Axios.delete(`${apiEndpoint}/woofers/${wooferId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  wooferId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/woofers/${wooferId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
