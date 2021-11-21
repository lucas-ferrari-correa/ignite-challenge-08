import { getRepository, Not, Repository } from "typeorm";

import { Statement } from "../entities/Statement";
import { ICreateStatementDTO } from "../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "./IStatementsRepository";

export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>;

  constructor() {
    this.repository = getRepository(Statement);
  }

  async create({
    user_id,
    destination_id,
    amount,
    description,
    type
  }: ICreateStatementDTO): Promise<Statement> {
    const statement = this.repository.create({
      user_id,
      destination_id,
      amount,
      description,
      type
    });

    return this.repository.save(statement);
  }

  async findStatementOperation({ statement_id, user_id }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.repository.findOne(statement_id, {
      where: { user_id }
    });
  }

  async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO):
    Promise<
      { balance: number } | { balance: number, statement: Statement[] }
    >
  {
    const statementWithoutTransfers = await this.repository.find({
      where: { user_id }
    });

    const statementWithTransfers = await this.repository.find({
      where: {
        destination_id: user_id,
        type: 'transfers'
      }
    })

    const balanceWithoutTransfers = statementWithoutTransfers.reduce((acc, operation) => {
      if (operation.type === 'deposit') {
        return acc + operation.amount;
      } else {
        return acc - operation.amount;
      }
    }, 0)

    const balanceWithTransfers = statementWithTransfers.reduce((acc, operation) => {
      return acc + operation.amount;
    }, 0)

    const statement: Statement[] = [];
    statement.push(...statementWithTransfers, ...statementWithoutTransfers)

    const balance = balanceWithoutTransfers + balanceWithTransfers;

    if (with_statement) {
      return {
        statement,
        balance
      }
    }

    return { balance }
  }
}
