const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'app',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const insertNewCourseRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'InsertNewCourse');
}
insertNewCourseRef.operationName = 'InsertNewCourse';
exports.insertNewCourseRef = insertNewCourseRef;

exports.insertNewCourse = function insertNewCourse(dc) {
  return executeMutation(insertNewCourseRef(dc));
};

const listAllCoursesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllCourses');
}
listAllCoursesRef.operationName = 'ListAllCourses';
exports.listAllCoursesRef = listAllCoursesRef;

exports.listAllCourses = function listAllCourses(dc) {
  return executeQuery(listAllCoursesRef(dc));
};

const updateCourseDescriptionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateCourseDescription', inputVars);
}
updateCourseDescriptionRef.operationName = 'UpdateCourseDescription';
exports.updateCourseDescriptionRef = updateCourseDescriptionRef;

exports.updateCourseDescription = function updateCourseDescription(dcOrVars, vars) {
  return executeMutation(updateCourseDescriptionRef(dcOrVars, vars));
};

const deleteCourseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteCourse', inputVars);
}
deleteCourseRef.operationName = 'DeleteCourse';
exports.deleteCourseRef = deleteCourseRef;

exports.deleteCourse = function deleteCourse(dcOrVars, vars) {
  return executeMutation(deleteCourseRef(dcOrVars, vars));
};
