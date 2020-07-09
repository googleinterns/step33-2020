package com.google.sps.servlets;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import com.google.sps.servlets.DBUtilities;
import org.mockito.Mockito;
import com.google.sps.servlets.RequestUtils;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@RunWith(JUnit4.class)
public final class RequestUtilsTest {

  @Test
  public void testCorrelatorValid() {
    HttpServletRequest request = Mockito.mock(HttpServletRequest.class);    

    Mockito.when(request.getParameter("correlator")).thenReturn("Person1");
    
    Assert.assertEquals(RequestUtils.getParameter(request, Property.CORRELATOR), "Person1");
  }

  @Test
  public void testCorrelatorInvalid() {
    HttpServletRequest request = Mockito.mock(HttpServletRequest.class);    

    Mockito.when(request.getParameter("correlator")).thenReturn("");
    
    Assert.assertEquals(RequestUtils.getParameter(request, Property.CORRELATOR), "");
  }

  @Test
  public void testCorrelatorNull() {
    HttpServletRequest request = Mockito.mock(HttpServletRequest.class);    

    Mockito.when(request.getParameter("correlator")).thenReturn(null);
    
    Assert.assertEquals(RequestUtils.getParameter(request, Property.CORRELATOR), "");
  }
}