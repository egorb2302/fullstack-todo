export interface ServerTodoType {
    userId: number,
    title: string,
    description: string | null,
    isCompleted: boolean
}

export interface ReportType {
    totalTasks: number,
    totalUsers: number,
    timestamp: string
}