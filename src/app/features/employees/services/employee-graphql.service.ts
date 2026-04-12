import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { Employee } from '../models/employee.model';

const employeeFragment = gql`
  fragment EmployeeFields on Employee {
    _id
    first_name
    last_name
    email
    gender
    designation
    salary
    date_of_joining
    department
    employee_photo
    created_at
    updated_at
  }
`;

const GET_ALL = gql`
  ${employeeFragment}
  query GetAllEmployees {
    getAllEmployees {
      ...EmployeeFields
    }
  }
`;

const GET_BY_ID = gql`
  ${employeeFragment}
  query GetEmployeeById($eid: ID!) {
    getEmployeeById(eid: $eid) {
      ...EmployeeFields
    }
  }
`;

const SEARCH = gql`
  ${employeeFragment}
  query SearchEmployees($designation: String, $department: String) {
    searchEmployees(designation: $designation, department: $department) {
      ...EmployeeFields
    }
  }
`;

const ADD = gql`
  mutation AddEmployee(
    $first_name: String!
    $last_name: String!
    $email: String!
    $gender: String!
    $designation: String!
    $salary: Float!
    $date_of_joining: String!
    $department: String!
    $employee_photo: Upload
  ) {
    addEmployee(
      first_name: $first_name
      last_name: $last_name
      email: $email
      gender: $gender
      designation: $designation
      salary: $salary
      date_of_joining: $date_of_joining
      department: $department
      employee_photo: $employee_photo
    ) {
      _id
    }
  }
`;

const UPDATE = gql`
  mutation UpdateEmployee(
    $eid: ID!
    $first_name: String
    $last_name: String
    $email: String
    $gender: String
    $designation: String
    $salary: Float
    $date_of_joining: String
    $department: String
    $employee_photo: Upload
  ) {
    updateEmployee(
      eid: $eid
      first_name: $first_name
      last_name: $last_name
      email: $email
      gender: $gender
      designation: $designation
      salary: $salary
      date_of_joining: $date_of_joining
      department: $department
      employee_photo: $employee_photo
    ) {
      _id
    }
  }
`;

const DELETE = gql`
  mutation DeleteEmployee($eid: ID!) {
    deleteEmployee(eid: $eid) {
      success
      message
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class EmployeeGraphqlService {
  constructor(private readonly apollo: Apollo) {}

  getAll(): Observable<Employee[]> {
    return this.apollo
      .watchQuery<{ getAllEmployees: Employee[] }>({ query: GET_ALL, fetchPolicy: 'network-only' })
      .valueChanges.pipe(map((r) => (r.data?.getAllEmployees ?? []) as Employee[]));
  }

  getById(id: string): Observable<Employee | null> {
    return this.apollo
      .query<{ getEmployeeById: Employee | null }>({
        query: GET_BY_ID,
        variables: { eid: id },
        fetchPolicy: 'network-only',
      })
      .pipe(map((r) => (r.data?.getEmployeeById ?? null) as Employee | null));
  }

  search(designation: string | null, department: string | null): Observable<Employee[]> {
    const d = designation?.trim() || null;
    const p = department?.trim() || null;
    return this.apollo
      .query<{ searchEmployees: Employee[] }>({
        query: SEARCH,
        variables: { designation: d, department: p },
        fetchPolicy: 'network-only',
      })
      .pipe(map((r) => (r.data?.searchEmployees ?? []) as Employee[]));
  }

  add(vars: {
    first_name: string;
    last_name: string;
    email: string;
    gender: string;
    designation: string;
    salary: number;
    date_of_joining: string;
    department: string;
    employee_photo?: File | null;
  }): Observable<void> {
    return this.apollo
      .mutate({
        mutation: ADD,
        variables: {
          first_name: vars.first_name,
          last_name: vars.last_name,
          email: vars.email,
          gender: vars.gender,
          designation: vars.designation,
          salary: vars.salary,
          date_of_joining: vars.date_of_joining,
          department: vars.department,
          employee_photo: vars.employee_photo ?? null,
        },
        refetchQueries: [{ query: GET_ALL }],
        awaitRefetchQueries: true,
      })
      .pipe(map(() => undefined));
  }

  update(
    eid: string,
    vars: Partial<{
      first_name: string;
      last_name: string;
      email: string;
      gender: string;
      designation: string;
      salary: number;
      date_of_joining: string;
      department: string;
      employee_photo: File | null;
    }>
  ): Observable<void> {
    const variables: Record<string, unknown> = { eid };
    (Object.entries(vars) as [string, unknown][]).forEach(([k, v]) => {
      if (v !== undefined) variables[k] = v;
    });
    return this.apollo
      .mutate({
        mutation: UPDATE,
        variables,
        refetchQueries: [{ query: GET_ALL }, { query: GET_BY_ID, variables: { eid } }],
        awaitRefetchQueries: true,
      })
      .pipe(map(() => undefined));
  }

  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.apollo
      .mutate<{ deleteEmployee: { success: boolean; message: string } }>({
        mutation: DELETE,
        variables: { eid: id },
        refetchQueries: [{ query: GET_ALL }],
        awaitRefetchQueries: true,
      })
      .pipe(map((r) => r.data!.deleteEmployee));
  }
}
