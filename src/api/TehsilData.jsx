import axios from "axios"
import { toast } from "react-toastify"
import { decryptID, encryptID } from "../utils/crypto"

const apiUrl = import.meta.env.VITE_APP_API_URL

const CONTROLLER = "gen_Tehsil"
const WHEREMETHOD = "GetTehsilWhere"
const DELETEMETHOD = "TehsilDelete"

// URL: /EduIMS/GetTehsilWhere?LoginUserID=??
export async function fetchAllTehsiles(LoginUserID) {
  const { data } = await axios.post(
    `${apiUrl}/${CONTROLLER}/${WHEREMETHOD}?LoginUserID=${LoginUserID}`
  )
  return data.data ?? []
}

// URL: /EduIMS/GetTehsilWhere?TehsilID=??&LoginUserID=??
export async function fetchTehsilById(TehsilID = 0, LoginUserID) {
  TehsilID = decryptID(TehsilID)
  if (TehsilID !== 0) {
    const { data } = await axios.post(
      `${apiUrl}/${CONTROLLER}/${WHEREMETHOD}?TehsilID=${TehsilID}&LoginUserID=${LoginUserID}`
    )
    return data.data ?? []
  } else {
    return []
  }
}
// URL: /EduIMS/TehsilDelete?TehsilID=??&LoginUserID=??
export async function deleteTehsilByID({ TehsilID, LoginUserID }) {
  TehsilID = decryptID(TehsilID)
  const { data } = await axios.post(
    `${apiUrl}/${CONTROLLER}/${DELETEMETHOD}?TehsilID=${TehsilID}&LoginUserID=${LoginUserID}`
  )

  if (data.success === true) {
    toast.success("Tehsil sucessfully deleted!")
    return true
  } else {
    toast.error(data.message, {
      autoClose: false,
    })
    return false
  }
}

export async function addNewTehsil({ formData, userID, TehsilID = 0 }) {
  try {
    let DataToSend = {
      TehsilTitle: formData.TehsilTitle,
      CountryID: formData?.Country,
      InActive: formData.InActive === true ? 1 : 0,
      EntryUserID: userID,
    }

    TehsilID = TehsilID !== 0 ? decryptID(TehsilID) : 0
    if (TehsilID === 0 || TehsilID === undefined) {
      DataToSend.TehsilID = 0
    } else {
      DataToSend.TehsilID = TehsilID
    }

    const { data } = await axios.post(
      apiUrl + `/${CONTROLLER}/TehsilInsertUpdate`,
      DataToSend
    )

    if (data.success === true) {
      if (TehsilID !== 0) {
        toast.success("Tehsil updated successfully!")
      } else {
        toast.success("Tehsil created successfully!")
      }
      return { success: true, RecordID: encryptID(data?.TehsilID) }
    } else {
      toast.error(data.message, {
        autoClose: false,
      })
      return { success: false, RecordID: encryptID(TehsilID) }
    }
  } catch (e) {
    toast.error(e.message, {
      autoClose: false,
    })
  }
}
