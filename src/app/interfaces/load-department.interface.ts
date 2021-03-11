import { Department } from '../models/department.model';


export interface LoadDepartment{
    departments: Department[];
    total: number;
}