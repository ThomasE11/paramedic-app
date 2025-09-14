import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'app',
  location: 'us-central1'
};

export const insertNewCourseRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'InsertNewCourse');
}
insertNewCourseRef.operationName = 'InsertNewCourse';

export function insertNewCourse(dc) {
  return executeMutation(insertNewCourseRef(dc));
}

export const listAllCoursesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllCourses');
}
listAllCoursesRef.operationName = 'ListAllCourses';

export function listAllCourses(dc) {
  return executeQuery(listAllCoursesRef(dc));
}

export const updateCourseDescriptionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateCourseDescription', inputVars);
}
updateCourseDescriptionRef.operationName = 'UpdateCourseDescription';

export function updateCourseDescription(dcOrVars, vars) {
  return executeMutation(updateCourseDescriptionRef(dcOrVars, vars));
}

export const deleteCourseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteCourse', inputVars);
}
deleteCourseRef.operationName = 'DeleteCourse';

export function deleteCourse(dcOrVars, vars) {
  return executeMutation(deleteCourseRef(dcOrVars, vars));
}

