
package com.google.sps.servlets;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.sps.servlets.DBUtilities;
import com.google.sps.servlets.Property;
import com.google.sps.servlets.RequestUtils;

@WebServlet("/initialize")
public class InitializeServlet extends HttpServlet {

 /**
  * Given the correlator, this will create an entry in the database with default
  * values.
  *
  * @param request This includes a correlator for the current user.
  * @param response A 200 status or 400 error
  */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        
    final String correlator = RequestUtils.getCorrelator(request);

    if (correlator.isEmpty()) {
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    // this doesn't handle an entry iwth the same correlator
    // the initialize route would send the key to the entity it creates
    // the js file would use that for the rest of the session

    // uuid

    // maybe ask ryan?
    // 3: hash function on client side
    // 5: don't handle collisions and assume they don't happen often and error out

    Entity interaction = new Entity(DBUtilities.INTERACTION_TABLE);
    interaction.setProperty(Property.CORRELATOR, correlator);
    interaction.setProperty(Property.FIND_NEAREST_LOCATION, false);
    interaction.setProperty(Property.GRANTS_LOCATION, false);
    interaction.setProperty(Property.INTERACTS_WITH_MAP, false);
    interaction.setProperty(Property.SKIP_TO_CONTENT, false);
    interaction.setProperty(Property.RETURN_TO_AD, false);

    DatastoreService dataStore = DatastoreServiceFactory.getDatastoreService();
    dataStore.put(interaction);

    response.setStatus(HttpServletResponse.SC_OK); 
  }
}