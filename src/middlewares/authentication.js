function isValidUser(authorizedValue, userValue) {
  if (userValue === authorizedValue)
    return true;
  else
    return false;
}

export function isAdmin() {
    return (req, res, next) => {
        if (isValidUser("admin", request.session.userRole)) {
            next();
        }
        else {
            res.status(401).json({message: "Vous n'avez pas les autorisations nécessaires pour effectuer cette action !"})
        }
    }

}