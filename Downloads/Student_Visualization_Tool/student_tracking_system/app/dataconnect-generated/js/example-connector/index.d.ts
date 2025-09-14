import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Course_Key {
  id: UUIDString;
  __typename?: 'Course_Key';
}

export interface DeleteCourseData {
  course_delete?: Course_Key | null;
}

export interface DeleteCourseVariables {
  id: UUIDString;
}

export interface Enrollment_Key {
  studentId: UUIDString;
  courseId: UUIDString;
  __typename?: 'Enrollment_Key';
}

export interface GroupMembership_Key {
  userId: UUIDString;
  groupId: UUIDString;
  __typename?: 'GroupMembership_Key';
}

export interface Group_Key {
  id: UUIDString;
  __typename?: 'Group_Key';
}

export interface InsertNewCourseData {
  course_insert: Course_Key;
}

export interface InstructorAssignment_Key {
  instructorId: UUIDString;
  courseId: UUIDString;
  __typename?: 'InstructorAssignment_Key';
}

export interface ListAllCoursesData {
  courses: ({
    id: UUIDString;
    academicYear: string;
    courseCode: string;
    courseName: string;
    semester: string;
    description?: string | null;
    createdAt: TimestampString;
  } & Course_Key)[];
}

export interface Message_Key {
  id: UUIDString;
  __typename?: 'Message_Key';
}

export interface UpdateCourseDescriptionData {
  course_update?: Course_Key | null;
}

export interface UpdateCourseDescriptionVariables {
  id: UUIDString;
  description: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface InsertNewCourseRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<InsertNewCourseData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<InsertNewCourseData, undefined>;
  operationName: string;
}
export const insertNewCourseRef: InsertNewCourseRef;

export function insertNewCourse(): MutationPromise<InsertNewCourseData, undefined>;
export function insertNewCourse(dc: DataConnect): MutationPromise<InsertNewCourseData, undefined>;

interface ListAllCoursesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllCoursesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllCoursesData, undefined>;
  operationName: string;
}
export const listAllCoursesRef: ListAllCoursesRef;

export function listAllCourses(): QueryPromise<ListAllCoursesData, undefined>;
export function listAllCourses(dc: DataConnect): QueryPromise<ListAllCoursesData, undefined>;

interface UpdateCourseDescriptionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCourseDescriptionVariables): MutationRef<UpdateCourseDescriptionData, UpdateCourseDescriptionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateCourseDescriptionVariables): MutationRef<UpdateCourseDescriptionData, UpdateCourseDescriptionVariables>;
  operationName: string;
}
export const updateCourseDescriptionRef: UpdateCourseDescriptionRef;

export function updateCourseDescription(vars: UpdateCourseDescriptionVariables): MutationPromise<UpdateCourseDescriptionData, UpdateCourseDescriptionVariables>;
export function updateCourseDescription(dc: DataConnect, vars: UpdateCourseDescriptionVariables): MutationPromise<UpdateCourseDescriptionData, UpdateCourseDescriptionVariables>;

interface DeleteCourseRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCourseVariables): MutationRef<DeleteCourseData, DeleteCourseVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteCourseVariables): MutationRef<DeleteCourseData, DeleteCourseVariables>;
  operationName: string;
}
export const deleteCourseRef: DeleteCourseRef;

export function deleteCourse(vars: DeleteCourseVariables): MutationPromise<DeleteCourseData, DeleteCourseVariables>;
export function deleteCourse(dc: DataConnect, vars: DeleteCourseVariables): MutationPromise<DeleteCourseData, DeleteCourseVariables>;

