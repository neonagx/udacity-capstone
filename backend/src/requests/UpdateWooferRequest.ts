/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateWooferRequest {
  name: string
  dueDate: string
  done: boolean
}