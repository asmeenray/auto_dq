import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export interface CreateUserInput {
  email: string
  name?: string
  password: string
}

export interface CreateDataSourceInput {
  name: string
  type: 'redshift' | 'snowflake' | 'bigquery'
  host: string
  port: number
  database: string
  schema?: string
  username: string
  password: string
  userId: string
  // Snowflake specific
  warehouse?: string
  role?: string
  account?: string
  // BigQuery specific
  projectId?: string
  keyFile?: string
  location?: string
}

export interface LoginInput {
  email: string
  password: string
}

export class AppDatabaseService {
  // User methods
  async createUser(data: CreateUserInput) {
    const hashedPassword = await bcrypt.hash(data.password, 12)
    
    return await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    })
  }

  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        dataSources: true,
      }
    })
  }

  async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    })
  }

  async validateUser(email: string, password: string) {
    const user = await this.getUserByEmail(email)
    if (!user) return null

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return null

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    }
  }

  // Data Source methods
  async createDataSource(data: CreateDataSourceInput) {
    return await prisma.dataSource.create({
      data: {
        name: data.name,
        type: data.type,
        host: data.host,
        port: data.port,
        database: data.database,
        schema: data.schema,
        username: data.username,
        password: data.password, // In production, encrypt this
        warehouse: data.warehouse,
        role: data.role,
        account: data.account,
        projectId: data.projectId,
        keyFile: data.keyFile, // In production, store securely
        location: data.location,
        userId: data.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })
  }

  async getDataSourcesByUserId(userId: string) {
    return await prisma.dataSource.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        indicators: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async getDataSourceById(id: string) {
    return await prisma.dataSource.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        indicators: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        }
      }
    })
  }

  async updateDataSource(id: string, data: Partial<CreateDataSourceInput>) {
    return await prisma.dataSource.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.host && { host: data.host }),
        ...(data.port && { port: data.port }),
        ...(data.database && { database: data.database }),
        ...(data.schema !== undefined && { schema: data.schema }),
        ...(data.username && { username: data.username }),
        ...(data.password && { password: data.password }),
        ...(data.warehouse !== undefined && { warehouse: data.warehouse }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.account !== undefined && { account: data.account }),
        ...(data.projectId !== undefined && { projectId: data.projectId }),
        ...(data.keyFile !== undefined && { keyFile: data.keyFile }),
        ...(data.location !== undefined && { location: data.location }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })
  }

  async deleteDataSource(id: string) {
    return await prisma.dataSource.delete({
      where: { id }
    })
  }

  // Indicator methods
  async createIndicator(data: {
    name: string
    description?: string
    query: string
    threshold?: number
    operator: string
    dataSourceId: string
    userId: string
  }) {
    return await prisma.indicator.create({
      data,
      include: {
        dataSource: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })
  }

  async getIndicatorsByUserId(userId: string) {
    return await prisma.indicator.findMany({
      where: { userId },
      include: {
        dataSource: true,
        executions: {
          orderBy: { executedAt: 'desc' },
          take: 5 // Last 5 executions
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  // Cleanup method
  async disconnect() {
    await prisma.$disconnect()
  }
}

export const appDb = new AppDatabaseService()
