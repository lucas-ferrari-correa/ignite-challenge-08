import { Statement } from "../../entities/Statement";

export type ICreateStatementDTO =
Pick<
  Statement,
  'user_id' |
  'destination_id' |
  'description' |
  'amount' |
  'type'
>
