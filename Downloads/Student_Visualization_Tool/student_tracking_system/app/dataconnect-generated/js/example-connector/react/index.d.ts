import { InsertNewCourseData, ListAllCoursesData, UpdateCourseDescriptionData, UpdateCourseDescriptionVariables, DeleteCourseData, DeleteCourseVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useInsertNewCourse(options?: useDataConnectMutationOptions<InsertNewCourseData, FirebaseError, void>): UseDataConnectMutationResult<InsertNewCourseData, undefined>;
export function useInsertNewCourse(dc: DataConnect, options?: useDataConnectMutationOptions<InsertNewCourseData, FirebaseError, void>): UseDataConnectMutationResult<InsertNewCourseData, undefined>;

export function useListAllCourses(options?: useDataConnectQueryOptions<ListAllCoursesData>): UseDataConnectQueryResult<ListAllCoursesData, undefined>;
export function useListAllCourses(dc: DataConnect, options?: useDataConnectQueryOptions<ListAllCoursesData>): UseDataConnectQueryResult<ListAllCoursesData, undefined>;

export function useUpdateCourseDescription(options?: useDataConnectMutationOptions<UpdateCourseDescriptionData, FirebaseError, UpdateCourseDescriptionVariables>): UseDataConnectMutationResult<UpdateCourseDescriptionData, UpdateCourseDescriptionVariables>;
export function useUpdateCourseDescription(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateCourseDescriptionData, FirebaseError, UpdateCourseDescriptionVariables>): UseDataConnectMutationResult<UpdateCourseDescriptionData, UpdateCourseDescriptionVariables>;

export function useDeleteCourse(options?: useDataConnectMutationOptions<DeleteCourseData, FirebaseError, DeleteCourseVariables>): UseDataConnectMutationResult<DeleteCourseData, DeleteCourseVariables>;
export function useDeleteCourse(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteCourseData, FirebaseError, DeleteCourseVariables>): UseDataConnectMutationResult<DeleteCourseData, DeleteCourseVariables>;
